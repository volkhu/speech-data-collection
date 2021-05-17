package ee.ttu.huvolk.speechdatacollection.fragments.profile

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.AutoCompleteTextView
import androidx.activity.OnBackPressedCallback
import androidx.core.widget.doAfterTextChanged
import androidx.fragment.app.Fragment
import androidx.navigation.findNavController
import androidx.navigation.fragment.findNavController
import ee.ttu.huvolk.speechdatacollection.MainActivity
import ee.ttu.huvolk.speechdatacollection.MainActivity.ViewState
import ee.ttu.huvolk.speechdatacollection.R
import ee.ttu.huvolk.speechdatacollection.databinding.FragmentProfileBinding
import ee.ttu.huvolk.speechdatacollection.network.BackendService
import ee.ttu.huvolk.speechdatacollection.network.data.PostProfileResponse
import ee.ttu.huvolk.speechdatacollection.network.data.Profile
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.util.*

class ProfileFragment : Fragment() {
    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    private var loadProfileCall: Call<Profile>? = null
    private var postProfileCall: Call<PostProfileResponse>? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        (activity as MainActivity).setTitle(getString(R.string.title_profile))

        bindForms()
        bindButtons()
        checkExistingProfile()
    }

    /**
     * Bind validators to profile registration form elements and populate fields
     * with preset choices.
     */
    private fun bindForms() {
        populateYearOfBirthDropdownMenu()
        populateGenderSelectionDropdownMenu()
        populateNativeLanguageSelectionDropdownMenu()
        populateDialectSelectionDropdownMenu()

        // reset any potential error messages on a form field after the user makes a correction
        binding.tilYearOfBirth.editText?.doAfterTextChanged {
            binding.tilYearOfBirth.isErrorEnabled = false
        }
        binding.tilGender.editText?.doAfterTextChanged {
            binding.tilGender.isErrorEnabled = false
        }
    }

    /**
     * Fill the year of birth dropdown selection menu with preset years from
     * 1900 to the current year based on the system's clock (minimum 2021).
     */
    private fun populateYearOfBirthDropdownMenu() {
        val currentYear = maxOf(2021, Calendar.getInstance().get(Calendar.YEAR))
        val years = (currentYear downTo 1900).toList().map { it.toString() }
        val adapter = ArrayAdapter(requireContext(), R.layout.item_dropdown, years)
        (binding.tilYearOfBirth.editText as? AutoCompleteTextView)?.setAdapter(adapter)
    }

    /**
     * Load gender selection dropdown menu choices from the strings resource file.
     */
    private fun populateGenderSelectionDropdownMenu() {
        val adapter = ArrayAdapter.createFromResource(
                requireContext(),
            R.array.gender_list,
            R.layout.item_dropdown
        )
        (binding.tilGender.editText as? AutoCompleteTextView)?.setAdapter(adapter)
    }

    /**
     * Load native language dropdown menu choices from the strings resource file.
     */
    private fun populateNativeLanguageSelectionDropdownMenu() {
        val adapter = ArrayAdapter.createFromResource(
                requireContext(),
            R.array.native_language_list,
            R.layout.item_dropdown
        )
        (binding.tilNativeLanguage.editText as? AutoCompleteTextView)?.setAdapter(adapter)
    }

    /**
     * Load dialect dropdown menu choices from the strings resource file.
     */
    private fun populateDialectSelectionDropdownMenu() {
        val adapter = ArrayAdapter.createFromResource(
                requireContext(),
            R.array.dialect_list,
            R.layout.item_dropdown
        )
        (binding.tilDialect.editText as? AutoCompleteTextView)?.setAdapter(adapter)
    }

    /**
     * Add listeners to exit, confirm and back buttons to fulfill appropriate actions.
     */
    private fun bindButtons() {
        binding.btExit.setOnClickListener {
            (activity as MainActivity).showExitDialog()
        }

        binding.btConfirm.setOnClickListener {
            postProfile()
        }

        // show a dialog when back button is pressed so the user would
        // not accidentally exit the app and lose their inputted data
        requireActivity().onBackPressedDispatcher.addCallback(viewLifecycleOwner, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                (requireActivity() as MainActivity).showExitDialog()
            }
        })
    }

    /**
     * Check if user has already registered a profile on this device. If so,
     * we can skip this screen.
     */
    private fun checkExistingProfile() {
        (activity as MainActivity).setViewState(ViewState.LOADING)

        loadProfileCall = BackendService.service.getProfile()
        loadProfileCall?.enqueue(object : Callback<Profile> {
            override fun onResponse(call: Call<Profile>, response: Response<Profile>) {
                when {
                    response.code() == 200 -> {
                        // profile exists, skip this registration screen
                        findNavController().navigate(R.id.action_profileFragment_to_projectSelectionFragment)
                    }
                    response.code() == 204 -> {
                        // no profile, show this fragment for user to create a new profile
                        (activity as MainActivity).setViewState(ViewState.FRAGMENT)
                    }
                    else -> {
                        onCheckExistingProfileFailed("Code " + response.code() + ": " + response.message())
                    }
                }
            }
            override fun onFailure(call: Call<Profile>, t: Throwable) {
                if (loadProfileCall?.isCanceled == false) {
                    onCheckExistingProfileFailed(t.message.toString())
                }
            }
        })
    }

    /**
     * Show user an error if checking existing profile fails for any reason.
     *
     * @param errorMessage error message to show to the user
     */
    private fun onCheckExistingProfileFailed(errorMessage: String) {
        (activity as MainActivity).setViewState(ViewState.ERROR, errorMessage) {
            if (activity != null) {
                checkExistingProfile()
            }
        }
    }

    /**
     * Check whether the user has selected their year of birth.
     *
     * @return whether the year of birth field has been filled out
     */
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

    /**
     * Check whether the user has selected their gender.
     *
     * @return whether the gender field has been filled out
     */
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

    /**
     * Verify the form fields and register the user by sending their
     * profile data to the back-end API.
     */
    private fun postProfile() {
        val yearOfBirthValid = validateYearOfBirthField()
        val genderValid = validateGenderField()
        if (yearOfBirthValid && genderValid) {
            (activity as MainActivity).setViewState(ViewState.LOADING)

            val profileData = Profile()
            profileData.yearOfBirth = binding.tilYearOfBirth.editText?.text.toString().toInt()
            profileData.gender = binding.tilGender.editText?.text.toString()
            profileData.nativeLanguage = binding.tilNativeLanguage.editText?.text.toString()
            profileData.dialect = binding.tilDialect.editText?.text.toString()

            postProfileCall = BackendService.service.postProfile(profileData = profileData)
            postProfileCall?.enqueue(object : Callback<PostProfileResponse> {
                override fun onResponse(call: Call<PostProfileResponse>, response: Response<PostProfileResponse>) {
                    if (response.code() == 200) {
                        findNavController().navigate(R.id.action_profileFragment_to_projectSelectionFragment)
                    } else {
                        onPostProfileDataFailed("Code " + response.code() + ": " + response.message())
                    }
                }

                override fun onFailure(call: Call<PostProfileResponse>, t: Throwable) {
                    if (postProfileCall?.isCanceled == false) {
                        onPostProfileDataFailed(t.message.toString())
                    }
                }
            })
        }
    }

    /**
     * Show user an error if saving their profile for any reason.
     *
     * @param errorMessage error message to show to the user
     */
    private fun onPostProfileDataFailed(errorMessage: String) {
        (activity as MainActivity).setViewState(ViewState.ERROR, errorMessage) {
            if (activity != null) {
                // show the registration form to user again to allow them to try again
                (activity as MainActivity).setViewState(ViewState.FRAGMENT)
            }
        }
    }

    override fun onDestroyView() {
        loadProfileCall?.cancel()
        postProfileCall?.cancel()

        super.onDestroyView()
        _binding = null
    }
}