package ee.ttu.huvolk.speechdatacollection

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.AutoCompleteTextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.widget.doAfterTextChanged
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import ee.ttu.huvolk.speechdatacollection.databinding.FragmentProfileBinding
import ee.ttu.huvolk.speechdatacollection.network.BackendService
import ee.ttu.huvolk.speechdatacollection.network.PostProfileResponse
import ee.ttu.huvolk.speechdatacollection.network.Profile
import ee.ttu.huvolk.speechdatacollection.network.ServiceBuilder
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.*


class ProfileFragment : Fragment() {
    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    private fun validateYearOfBirthField(): Boolean {
        val yearOfBirthValue = binding.tilYearOfBirth.editText?.text.toString()

        if (yearOfBirthValue.isEmpty()) {
            binding.tilYearOfBirth.isErrorEnabled = true
            binding.tilYearOfBirth.error = getString(R.string.field_required)
            return false
        }

        binding.tilYearOfBirth.isErrorEnabled = false
        binding.tilYearOfBirth.error = null
        return true
    }

    private fun validateGenderField(): Boolean {
        val genderValue = binding.tilGender.editText?.text.toString()

        if (genderValue.isEmpty()) {
            binding.tilGender.isErrorEnabled = true
            binding.tilGender.error = getString(R.string.field_required)
            return false
        }

        binding.tilGender.isErrorEnabled = false
        binding.tilGender.error = null
        return true
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // show progress indicator and hide this fragment while we check
        view.visibility = View.INVISIBLE
        (activity as MainActivity).setIsLoading(true)

        binding.tilYearOfBirth.editText?.doAfterTextChanged {
            validateYearOfBirthField()
        }
        binding.tilGender.editText?.doAfterTextChanged {
            validateGenderField()
        }

        binding.btExit.setOnClickListener {
            activity?.finish()
        }
        binding.btConfirm.setOnClickListener {
            val yearOfBirthValid = validateYearOfBirthField()
            val genderValid = validateGenderField()
            if (yearOfBirthValid && genderValid) {
                view.visibility = View.INVISIBLE
                (activity as MainActivity).setIsLoading(true)

                // send request and move to next
                val api = ServiceBuilder.buildBackendService()
                val profileData = Profile()
                profileData.yearOfBirth = binding.tilYearOfBirth.editText?.text.toString().toInt()
                profileData.gender = binding.tilGender.editText?.text.toString()
                profileData.nativeLanguage = binding.tilNativeLanguage.editText?.text.toString()
                profileData.dialect = binding.tilDialect.editText?.text.toString()
                api.postProfile(deviceId = (activity as MainActivity).getDeviceId(), profileData = profileData).enqueue(
                    object : Callback<PostProfileResponse> {
                        override fun onResponse(
                            call: Call<PostProfileResponse>,
                            response: Response<PostProfileResponse>
                        ) {
                            (activity as MainActivity).setIsLoading(false)

                            if (response.code() == 200) {
                                Log.d("ProfileFragment", "Posted profile successfully: " + response.body())
                                findNavController().navigate(R.id.action_profileFragment_to_projectSelectionFragment)
                            } else {
                                view.visibility = View.VISIBLE
                                Log.d("ProfileFragment", "Posting profile result not code 200: " + response.body())
                            }
                        }

                        override fun onFailure(call: Call<PostProfileResponse>, t: Throwable) {
                            Log.d("ProfileFragment", "Failed to post profile: " + t.message)
                            view.visibility = View.VISIBLE
                            (activity as MainActivity).setIsLoading(false)
                        }
                    }
                )
            }
        }

        (activity as AppCompatActivity).supportActionBar?.title = getString(R.string.title_profile)

        populateYearOfBirthDropdownMenu()
        populateGenderSelectionDropdownMenu()

        val api = ServiceBuilder.buildBackendService()

        // check if user has already registered a profile
        api.getProfile(deviceId = (activity as MainActivity).getDeviceId()).enqueue(object : Callback<Profile> {
            override fun onResponse(call: Call<Profile>, response: Response<Profile>) {
                if (response.code() == 200) {
                    Log.d("ProfileFragment", "Got response code 200, profile already exists.")

                    // disable loading prompt and go to the project selection fragment
                    (activity as MainActivity).setIsLoading(false)
                    findNavController().navigate(R.id.action_profileFragment_to_projectSelectionFragment)
                } else if (response.code() == 404) {
                    Log.d("ProfileFragment", "Got response code 404, no profile created yet.")

                    // remove progress indicator and show this fragment for user to create a new profile
                    view.visibility = View.VISIBLE
                    (activity as MainActivity).setIsLoading(false)
                } else {
                    Log.d("ProfileFragment", "Unknown response: ${response.code()} and ${response.body()}")
                }
            }
            override fun onFailure(call: Call<Profile>, t: Throwable) {
                Log.d("ProfileFragment", "Got failure: " + t.message)
            }
        })
    }

    private fun populateYearOfBirthDropdownMenu() {
        val currentYear = maxOf(2021, Calendar.getInstance().get(Calendar.YEAR))
        val years = (currentYear downTo 1900).toList().map { it.toString() }
        val adapter = ArrayAdapter(requireContext(), R.layout.item_dropdown, years)
        (binding.tilYearOfBirth.editText as? AutoCompleteTextView)?.setAdapter(adapter)
    }

    private fun populateGenderSelectionDropdownMenu() {
        val adapter = ArrayAdapter.createFromResource(
            requireContext(),
            R.array.gender_list,
            R.layout.item_dropdown
        )
        (binding.tilGender.editText as? AutoCompleteTextView)?.setAdapter(adapter)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}