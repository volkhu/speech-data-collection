package ee.ttu.huvolk.speechdatacollection.fragments.terms

import android.content.Context
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import ee.ttu.huvolk.speechdatacollection.MainActivity
import ee.ttu.huvolk.speechdatacollection.MainActivity.ViewState
import ee.ttu.huvolk.speechdatacollection.R
import ee.ttu.huvolk.speechdatacollection.databinding.FragmentTermsBinding
import ee.ttu.huvolk.speechdatacollection.network.BackendService
import ee.ttu.huvolk.speechdatacollection.network.data.Terms
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class TermsFragment : Fragment() {
    private var _binding: FragmentTermsBinding? = null
    private val binding get() = _binding!!

    private var loadTermsCall: Call<Terms>? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentTermsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        (activity as MainActivity).setTitle(getString(R.string.title_terms))

        bindButtons()
        loadTerms()
    }

    /**
     * Add listeners to back and agree buttons to fulfill appropriate actions.
     */
    private fun bindButtons() {
        binding.btBack.setOnClickListener {
            findNavController().navigate(R.id.action_termsFragment_to_welcomeFragment)
        }

        binding.btAgree.setOnClickListener {
            setTermsAccepted()
            findNavController().navigate(R.id.action_termsFragment_to_profileFragment)
        }
    }

    /**
     * Load the application's terms of use from the remote back-end API.
     */
    private fun loadTerms() {
        (activity as MainActivity).setViewState(ViewState.LOADING)

        loadTermsCall = BackendService.service.getTerms()
        loadTermsCall?.enqueue(object : Callback<Terms> {
            override fun onResponse(call: Call<Terms>, response: Response<Terms>) {
                if (response.code() == 200) {
                    binding.tvTerms.text = response.body()?.mobileAppTerms
                    (activity as MainActivity).setViewState(ViewState.FRAGMENT)
                } else {
                    onLoadTermsFailed("Code " + response.code() + ": " + response.message())
                }
            }

            override fun onFailure(call: Call<Terms>, t: Throwable) {
                if (loadTermsCall?.isCanceled == false) {
                    onLoadTermsFailed(t.message.toString())
                }
            }
        })
    }

    /**
     * Show user an error if loading terms fails for any reason.
     *
     * @param errorMessage error message to show to the user
     */
    private fun onLoadTermsFailed(errorMessage: String) {
        (activity as MainActivity).setViewState(ViewState.ERROR, errorMessage) {
            if (activity != null) {
                loadTerms()
            }
        }
    }

    /**
     * Update the application's saved preferences with the fact that the user
     * has accepted the terms.
     */
    private fun setTermsAccepted() {
        val sharedPreferences = activity?.getPreferences(Context.MODE_PRIVATE)
        sharedPreferences?.edit()?.putBoolean(getString(R.string.has_accepted_terms_key), true)?.apply()
    }

    override fun onDestroyView() {
        loadTermsCall?.cancel()

        super.onDestroyView()
        _binding = null
    }
}
