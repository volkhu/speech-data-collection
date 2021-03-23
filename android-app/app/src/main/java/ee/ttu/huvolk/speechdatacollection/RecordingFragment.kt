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
import ee.ttu.huvolk.speechdatacollection.databinding.FragmentRecordingBinding
import ee.ttu.huvolk.speechdatacollection.network.Prompt
import ee.ttu.huvolk.speechdatacollection.network.ServiceBuilder
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response


class RecordingFragment : Fragment() {
    private var _binding: FragmentRecordingBinding? = null
    private val binding get() = _binding!!

    private var recording: Boolean = false
    private var projectId: Int = 0
    private var projectTitle: String = ""

    private var mediaRecorder: MediaRecorder? = null

    override fun onCreateView(
            inflater: LayoutInflater, container: ViewGroup?,
            savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentRecordingBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.visibility = View.INVISIBLE
        (activity as MainActivity).enableLoadingIcon()
        (activity as AppCompatActivity).supportActionBar?.title = arguments?.getString("projectTitle")

        // create mediarecorder
        //mediaRecorder = MediaRecorder()
        //mediaRecorder?.setAudioSource(MediaRecorder.AudioSource.MIC)
        //mediaRecorder?.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
        //mediaRecorder?.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)

        // get a new prompt
        val api = ServiceBuilder.buildBackendService()
        projectId = arguments?.getInt("projectId")!!
        projectTitle = arguments?.getString("projectTitle")!!

        api.getRandomPrompt(pid = projectId).enqueue(object : Callback<Prompt> {
            override fun onResponse(call: Call<Prompt>, response: Response<Prompt>) {
                (activity as MainActivity).disableLoadingIcon()
                if (response.code() == 200) {
                    view.visibility = View.VISIBLE
                    Log.d("RecordingFragment", "Got response code 200, can list prompt")

                    if (response.body()?.imageData != null) {
                        val decodedString: ByteArray = Base64.decode(response.body()?.imageData, Base64.DEFAULT)
                        val decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.size)
                        binding.ivPrompt.setImageBitmap(decodedByte)
                        binding.ivPrompt.visibility = View.VISIBLE
                        binding.svTextPrompt.visibility = View.INVISIBLE
                        binding.tvInstructions.text = response.body()?.instructions
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
            val permissions = arrayOf(android.Manifest.permission.RECORD_AUDIO)
            ActivityCompat.requestPermissions(requireActivity(), permissions, 0)
            return
        }

        binding.tvRecordingMessage.text = getString(R.string.stop_recording_instructions)
        binding.ibtRecord.setImageResource(R.drawable.recording_button_red)
        recording = true
    }

    private fun finishRecording() {
        // already recording, stop and go to next prompt
        val bundle = bundleOf("projectId" to projectId, "projectTitle" to projectTitle)
        findNavController().navigate(R.id.action_recordingFragment_self, bundle)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}