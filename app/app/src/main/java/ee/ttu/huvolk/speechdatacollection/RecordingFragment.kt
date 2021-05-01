package ee.ttu.huvolk.speechdatacollection

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.BitmapFactory
import android.graphics.Typeface
import android.media.MediaRecorder
import android.os.Bundle
import android.util.Base64
import android.util.Log
import android.util.TypedValue
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.google.android.material.snackbar.Snackbar
import ee.ttu.huvolk.speechdatacollection.databinding.FragmentRecordingBinding
import ee.ttu.huvolk.speechdatacollection.network.*
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.File
import java.io.IOException


class RecordingFragment : Fragment() {
    private var _binding: FragmentRecordingBinding? = null
    private val binding get() = _binding!!

    private var recording: Boolean = false
    private var projectId: Int = 0
    private var projectTitle: String = ""
    private var promptId: Int = 0
    private var recStart: Long = 0

    private var mediaRecorder: MediaRecorder? = null
    private var mediaOutputPath: String? = null

    override fun onCreateView(
            inflater: LayoutInflater, container: ViewGroup?,
            savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentRecordingBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        mediaOutputPath = requireContext().cacheDir.toString() + "/temp_recording.m4a"

        view.visibility = View.INVISIBLE
        (activity as MainActivity).setIsLoading(true)
        (activity as AppCompatActivity).supportActionBar?.title = arguments?.getString("projectTitle")

        // get a new prompt
        val api = BackendService.service
        projectId = arguments?.getInt("projectId")!!
        projectTitle = arguments?.getString("projectTitle")!!

        api.getPrompt(
                projectId = projectId
        ).enqueue(object : Callback<Prompt> {
            override fun onResponse(call: Call<Prompt>, response: Response<Prompt>) {
                (activity as MainActivity).setIsLoading(false)
                if (response.code() == 200) {
                    view.visibility = View.VISIBLE
                    Log.d("RecordingFragment", "Got response code 200, can list prompt")

                    val hasImage = response.body()?.imageData != null && response.body()?.imageData?.length!! > 0

                    if (hasImage) {
                        Log.d("RecordingFragment", "Got image")
                        var imageData = response.body()?.imageData?.replace("data:image/jpeg;base64,", "")

                        val decodedString: ByteArray = Base64.decode(imageData, Base64.DEFAULT)
                        val decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.size)

                        binding.ivPrompt.setImageBitmap(decodedByte)
                        binding.ivPrompt.visibility = View.VISIBLE
                        binding.svTextPrompt.visibility = View.INVISIBLE
                        if (response.body()?.instructions?.length!! > 0) {
                            binding.tvInstructions.text = response.body()?.instructions
                        } else {
                            binding.tvInstructions.text = getString(R.string.default_image_instructions)
                        }
                        binding.tvInstructions.setTypeface(binding.tvInstructions.typeface, Typeface.BOLD)
                    }

                    Log.d("RecordingFragment", "Image data size = " + response.body()?.imageData?.length)

                    binding.tvPrompt.text = response.body()?.description

                    var calculatedTextSize = 36.0f
                    if (binding.tvPrompt.text.length > 64) {
                        calculatedTextSize -= (binding.tvPrompt.text.length - 64) * 0.05f
                    }
                    if (calculatedTextSize < 22.0f) {
                        calculatedTextSize = 22.0f
                    }
                    binding.tvPrompt.setTextSize(TypedValue.COMPLEX_UNIT_SP, calculatedTextSize)
                    promptId = response.body()?.promptId!!
                } else if (response.code() == 204) {
                    // project completed, redirect back to projects
                    findNavController().navigate(R.id.action_recordingFragment_to_projectSelectionFragment)
                    Snackbar.make(
                            requireView(), getString(R.string.project_completed_message),
                            Snackbar.LENGTH_SHORT
                    ).show()
                } else if (response.code() == 403) {
                    findNavController().navigate(R.id.action_recordingFragment_to_projectSelectionFragment)
                    Snackbar.make(
                            requireView(), getString(R.string.project_already_completed),
                            Snackbar.LENGTH_SHORT
                    ).show()
                } else {
                    Log.d("RecordingFragment", "Unknown successful response: $response")
                }
            }

            override fun onFailure(call: Call<Prompt>, t: Throwable) {
                Log.d("RecordingFragment", "Got failure: " + t.message)
            }
        })

        binding.ibtRecord.setOnClickListener {
            if (!recording) {
                startRecording()
            } else {
                finishRecording()
            }
        }
    }


    private fun startRecording() {
        if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            Snackbar.make(
                    requireView(), getString(R.string.please_allow_recording_permissions),
                    Snackbar.LENGTH_SHORT
            ).show()

            val permissions = arrayOf(android.Manifest.permission.RECORD_AUDIO)
            ActivityCompat.requestPermissions(requireActivity(), permissions, 0)
            return
        }

        // got permissions, create media recorder
        if (mediaRecorder == null) {
            try {
                mediaRecorder = MediaRecorder()
                mediaRecorder?.setAudioSource(MediaRecorder.AudioSource.MIC)
                mediaRecorder?.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                mediaRecorder?.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)

                Log.d("RecordingFragment", "mediaOutputPath: $mediaOutputPath")
                mediaRecorder?.setOutputFile(mediaOutputPath)

                // must be called last
                mediaRecorder?.prepare()
                mediaRecorder?.start()
            } catch (e: Exception) {
                e.printStackTrace()

                Snackbar.make(
                        requireView(), "Unable to initialize media recorder.",
                        Snackbar.LENGTH_SHORT
                ).show()
                return
            }
        }

        binding.tvRecordingMessage.text = getString(R.string.stop_recording_instructions)
        binding.ibtRecord.setImageResource(R.drawable.recording_button_red)
        recording = true
        recStart = System.nanoTime()
    }

    private fun finishRecording() {
        view?.visibility = View.INVISIBLE
        (activity as MainActivity).setIsLoading(true)

        mediaRecorder?.stop()
        mediaRecorder?.reset()
        mediaRecorder?.release()
        mediaRecorder = null

        var audioFileContents = ""
        try {
            val byteArray = File(mediaOutputPath).readBytes()
            audioFileContents = Base64.encodeToString(byteArray, Base64.NO_WRAP)
        } catch (e: IOException) {
            e.printStackTrace()

            Snackbar.make(
                    requireView(), "Unable to read recorded audio file.",
                    Snackbar.LENGTH_SHORT
            ).show()
            return
        }

        // already recording, stop and go to next prompt
        val api = BackendService.service

        val recordingData = Recording()
        recordingData.projectId = projectId
        recordingData.promptId = promptId
        recordingData.recordedFile = audioFileContents
        recordingData.durationInSeconds = ((System.nanoTime() - recStart) / 1e9).toFloat()

        api.postRecording(recordingData = recordingData).enqueue(
                object : Callback<PostRecordingResponse> {
            override fun onResponse(call: Call<PostRecordingResponse>, response: Response<PostRecordingResponse>) {
                Log.d("RecordingFragment", "onResponse: " + response.code() + " and " + response.body())
                val bundle = bundleOf("projectId" to projectId, "projectTitle" to projectTitle)
                findNavController().navigate(R.id.action_recordingFragment_self, bundle)
            }

            override fun onFailure(call: Call<PostRecordingResponse>, t: Throwable) {
                //val bundle = bundleOf("projectId" to projectId, "projectTitle" to projectTitle)
                //findNavController().navigate(R.id.action_recordingFragment_self, bundle)
            }
        })
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}