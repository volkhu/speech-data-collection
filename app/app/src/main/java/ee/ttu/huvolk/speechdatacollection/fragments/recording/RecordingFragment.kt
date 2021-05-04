package ee.ttu.huvolk.speechdatacollection.fragments.recording

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.BitmapFactory
import android.media.AudioFormat
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Base64
import android.util.TypedValue
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.github.squti.androidwaverecorder.WaveRecorder
import com.google.android.material.snackbar.Snackbar
import ee.ttu.huvolk.speechdatacollection.MainActivity
import ee.ttu.huvolk.speechdatacollection.MainActivity.ViewState
import ee.ttu.huvolk.speechdatacollection.R
import ee.ttu.huvolk.speechdatacollection.databinding.FragmentRecordingBinding
import ee.ttu.huvolk.speechdatacollection.network.*
import ee.ttu.huvolk.speechdatacollection.network.data.PostRecordingResponse
import ee.ttu.huvolk.speechdatacollection.network.data.Prompt
import ee.ttu.huvolk.speechdatacollection.network.data.Recording
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.File

// constants related to automatic resizing of prompt text
private const val PROMPT_TEXT_BASE_SIZE: Float = 36.0f
private const val PROMPT_TEXT_MIN_SIZE: Float = 22.0f
private const val PROMPT_TEXT_SCALE_CUTOFF: Int = 64
private const val PROMPT_TEXT_SCALE_FACTOR: Float = 0.05f

// constants related to audio recording
private const val AUDIO_SAMPLE_RATE = 44100 // 44100 is guaranteed to work on all devices
private const val AUDIO_CHANNEL_MODE = AudioFormat.CHANNEL_IN_MONO // mono works on all devices
private const val AUDIO_ENCODING = AudioFormat.ENCODING_PCM_16BIT // PCM 16-bit is guaranteed to work
private const val AUDIO_STOP_DELAY_MILLIS = 300L // how long to keep recording after user presses stop button

class RecordingFragment : Fragment() {
    private var _binding: FragmentRecordingBinding? = null
    private val binding get() = _binding!!

    private var projectId: Int = 0
    private var projectTitle: String = ""
    private var promptId: Int = 0

    private lateinit var mediaOutputPath: String
    private lateinit var waveRecorder: WaveRecorder
    private var recording: Boolean = false
    private var recordingStartTime: Long = 0
    private var recordingEndTime: Long = 0
    private var stopRecorderDelayHandler: Handler? = null
    private val stopRecordingRunnable: Runnable = Runnable { finishRecording() }

    private var loadPromptCall: Call<Prompt>? = null
    private var postRecordingCall: Call<PostRecordingResponse>? = null

    override fun onCreateView(
            inflater: LayoutInflater, container: ViewGroup?,
            savedInstanceState: Bundle?
    ): View {
        _binding = FragmentRecordingBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        if (configureFragment()) {
            (activity as MainActivity).setTitle(getString(R.string.title_recording_screen, projectTitle))

            bindButtons()
            loadPrompt()
        } else {
            findNavController().navigate(R.id.action_recordingFragment_to_projectSelectionFragment)
        }
    }

    /**
     * Read project id and title off the fragment arguments and construct the
     * temporary media file path.
     *
     * @return whether the configuration was successful
     */
    private fun configureFragment(): Boolean {
        projectId = arguments?.getInt("projectId") ?: 0
        if (projectId == 0) {
            return false
        }

        projectTitle = arguments?.getString("projectTitle") ?: getString(R.string.unknown)
        mediaOutputPath = requireContext().cacheDir.toString() + "/" + getString(R.string.temp_recording_filename)

        waveRecorder = WaveRecorder(mediaOutputPath)
        waveRecorder.waveConfig.sampleRate = AUDIO_SAMPLE_RATE
        waveRecorder.waveConfig.channels = AUDIO_CHANNEL_MODE
        waveRecorder.waveConfig.audioEncoding = AUDIO_ENCODING

        return true
    }

    /**
     * Add listener to the large recording button.
     */
    private fun bindButtons() {
        binding.ibtRecord.setOnClickListener {
            onRecordingButtonClicked()
        }
    }

    /**
     * Load a new prompt for the project specified in this fragment's arguments
     * from the back-end API.
     */
    private fun loadPrompt() {
        (activity as MainActivity).setViewState(ViewState.LOADING)

        loadPromptCall = BackendService.service.getPrompt(projectId)
        loadPromptCall?.enqueue(object : Callback<Prompt> {
            override fun onResponse(call: Call<Prompt>, response: Response<Prompt>) {
                val prompt = response.body()

                when {
                    (response.code() == 200 && prompt != null) -> {
                        onPromptLoaded(prompt)
                    }
                    response.code() == 204 -> {
                        onProjectJustCompleted()
                    }
                    response.code() == 403 -> {
                        onProjectAlreadyCompleted()
                    }
                    else -> {
                        onLoadPromptFailed("Code " + response.code() + ": " + response.message())
                    }
                }
            }

            override fun onFailure(call: Call<Prompt>, t: Throwable) {
                if (loadPromptCall?.isCanceled == false) {
                    onLoadPromptFailed(t.message.toString())
                }
            }
        })
    }

    /**
     * Take a prompt that was received successfully from the back-end,
     * decode it, and show it to the user.
     *
     * @param prompt prompt data structure received from the back-end API
     */
    private fun onPromptLoaded(prompt: Prompt) {
        val image: Boolean = prompt.imageData != null

        if (image) {
            decodeAndUpdateImage(prompt.imageData)
        }

        // show/hide image and text based on prompt type
        binding.ivPrompt.visibility = if (image) View.VISIBLE else View.GONE
        binding.svTextPrompt.visibility = if (image) View.GONE else View.VISIBLE

        if (prompt.instructions.isNullOrBlank()) {
            // no custom instructions provided, use default image or text instructions
            if (image) {
                binding.tvInstructions.text = getString(R.string.default_image_instructions)
            } else {
                binding.tvInstructions.text = getString(R.string.default_recording_instructions)
            }
        } else {
            // custom instructions provided, use these
            binding.tvInstructions.text = prompt.instructions
        }

        // update and resize prompt text
        binding.tvPrompt.text = prompt.description
        resizePromptFont()
        promptId = prompt.promptId ?: 0

        (activity as MainActivity).setViewState(ViewState.FRAGMENT)
    }

    /**
     * Decode the image sent in base64 format from the back-end API and
     * update the image view element with the result.
     *
     * @param base64ImageData base64 encoded jpeg image
     */
    private fun decodeAndUpdateImage(base64ImageData: String?) {
        // decode image from base64 string format
        val decodedString: ByteArray = Base64.decode(base64ImageData, Base64.DEFAULT)
        val decodedBytes = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.size)

        // update the prompt image view with the new decoded image
        binding.ivPrompt.setImageBitmap(decodedBytes)
    }

    /**
     * Make sure that the text prompt is clearly visible, but not clipping
     * where it shouldn't.
     */
    private fun resizePromptFont() {
        var calculatedTextSize = PROMPT_TEXT_BASE_SIZE

        // scale down the text after a certain length limit is exceeded
        if (binding.tvPrompt.text.length > PROMPT_TEXT_SCALE_CUTOFF) {
            calculatedTextSize -= (binding.tvPrompt.text.length - PROMPT_TEXT_SCALE_CUTOFF) * PROMPT_TEXT_SCALE_FACTOR
        }

        if (calculatedTextSize < PROMPT_TEXT_MIN_SIZE) {
            calculatedTextSize = PROMPT_TEXT_MIN_SIZE
        }

        binding.tvPrompt.setTextSize(TypedValue.COMPLEX_UNIT_SP, calculatedTextSize)
    }

    /**
     * Show user an error if loading the prompt fails for any reason.
     *
     * @param errorMessage error message to show to the user
     */
    private fun onLoadPromptFailed(errorMessage: String) {
        (activity as MainActivity).setViewState(ViewState.ERROR, errorMessage) {
            if (activity != null) {
                loadPrompt()
            }
        }
    }

    /**
     * Notify the user that they have just recorded the last prompt in this
     * project and that it has now been marked as completed. Redirect the
     * user to the project selection page.
     */
    private fun onProjectJustCompleted() {
        Snackbar.make(
                requireView(), getString(R.string.project_completed_message),
                Snackbar.LENGTH_SHORT
        ).show()

        findNavController().navigate(R.id.action_recordingFragment_to_projectSelectionFragment)
    }

    /**
     * Notify user that the project they are trying to record has already
     * been completed, that they cannot participate in it again, and redirect
     * them to the project selection page.
     */
    private fun onProjectAlreadyCompleted() {
        Snackbar.make(
                requireView(), getString(R.string.project_already_completed),
                Snackbar.LENGTH_SHORT
        ).show()

        findNavController().navigate(R.id.action_recordingFragment_to_projectSelectionFragment)
    }

    /**
     * Handle the necessary action of the large recording button based
     * on the recording state.
     */
    private fun onRecordingButtonClicked() {
        if (!recording) {
            startRecording()
        } else {
            // delay the stopping of recording a bit to make sure we don't cut off
            // last words due to a little delay in the Android audio recorder
            (requireActivity() as MainActivity).setViewState(ViewState.LOADING)
            stopRecorderDelayHandler = Handler(Looper.getMainLooper())
            stopRecorderDelayHandler?.postDelayed(stopRecordingRunnable, AUDIO_STOP_DELAY_MILLIS)
        }
    }

    /**
     * Start the recording process.
     */
    private fun startRecording() {
        if (!checkRecordPermissions()) {
            return
        }

        try {
            waveRecorder.startRecording()
        } catch (e: Exception) {
            Snackbar.make(
                    requireView(), "Unable to start audio recording: " + e.message,
                    Snackbar.LENGTH_LONG
            ).show()
            return
        }

        binding.tvRecordingMessage.text = getString(R.string.stop_recording_instructions)
        binding.ibtRecord.setImageResource(R.drawable.recording_button_red)
        recording = true
        recordingStartTime = System.nanoTime()
    }

    /**
     * Check whether the user has granted this application audio recording privileges.
     * If not, then a request will be made.
     */
    private fun checkRecordPermissions(): Boolean {
        if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED) {
            Snackbar.make(
                    requireView(), getString(R.string.please_allow_recording_permissions),
                    Snackbar.LENGTH_SHORT
            ).show()

            val permissionsList = arrayOf(Manifest.permission.RECORD_AUDIO)
            ActivityCompat.requestPermissions(requireActivity(), permissionsList, 0)
            return false
        }

        return true
    }

    /**
     * End the recording process.
     */
    private fun finishRecording() {
        waveRecorder.stopRecording()
        recordingEndTime = System.nanoTime()
        binding.ibtRecord.setImageResource(R.drawable.recording_button_blue)

        postRecording()
    }

    /**
     * Send the recorded audio file to the back-end server.
     */
    private fun postRecording() {
        (activity as MainActivity).setViewState(ViewState.LOADING)

        // construct recording data structure to send to server
        val recordingData = Recording()
        recordingData.projectId = projectId
        recordingData.promptId = promptId
        recordingData.durationInSeconds = ((recordingEndTime - recordingStartTime) / 1e9).toFloat()

        try {
            recordingData.recordedFile = readTempAudioFileToBase64()
        } catch (e: Exception) {
            onPostRecordingFailed(e.message.toString())
            return
        }

        postRecordingCall = BackendService.service.postRecording(recordingData = recordingData)
        postRecordingCall?.enqueue(object : Callback<PostRecordingResponse> {
            override fun onResponse(call: Call<PostRecordingResponse>, response: Response<PostRecordingResponse>) {
                if (response.code() == 200) {
                    goToNextPrompt()
                } else {
                    onPostRecordingFailed("Code " + response.code() + ": " + response.message())
                }
            }

            override fun onFailure(call: Call<PostRecordingResponse>, t: Throwable) {
                if (postRecordingCall?.isCanceled == false) {
                    onPostRecordingFailed(t.message.toString())
                }
            }
        })
    }

    /**
     * Read the recorded temporary audio file into memory as base64
     * encoded string to send to the back-end API.
     */
    private fun readTempAudioFileToBase64(): String {
        val byteArray = File(mediaOutputPath).readBytes()
        return Base64.encodeToString(byteArray, Base64.NO_WRAP)
    }

    /**
     * Show user an error if posting the recording fails for any reason.
     *
     * @param errorMessage error message to show to the user
     */
    private fun onPostRecordingFailed(errorMessage: String) {
        (activity as MainActivity).setViewState(ViewState.ERROR, errorMessage) {
            if (activity != null) {
                postRecording()
            }
        }
    }

    /**
     * Navigate back to this very fragment, but load a
     * different (the next) prompt this time.
     */
    private fun goToNextPrompt() {
        val bundle = bundleOf("projectId" to projectId, "projectTitle" to projectTitle)
        findNavController().navigate(R.id.action_recordingFragment_self, bundle)
    }

    override fun onDestroyView() {
        loadPromptCall?.cancel()
        postRecordingCall?.cancel()
        stopRecorderDelayHandler?.removeCallbacks(stopRecordingRunnable)
        waveRecorder.stopRecording()

        super.onDestroyView()
        _binding = null
    }
}