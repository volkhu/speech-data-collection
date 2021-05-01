package ee.ttu.huvolk.speechdatacollection

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import ee.ttu.huvolk.speechdatacollection.databinding.FragmentTermsBinding

class TermsFragment : Fragment() {
    private var _binding: FragmentTermsBinding? = null
    private val binding get() = _binding!!

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
    }

    private fun bindButtons() {
        binding.btBack.setOnClickListener {
            findNavController().navigate(R.id.action_termsFragment_to_welcomeFragment)
        }

        binding.btAgree.setOnClickListener {
            setTermsAccepted()
            findNavController().navigate(R.id.action_termsFragment_to_profileFragment)
        }
    }

    private fun setTermsAccepted() {
        val sharedPreferences = activity?.getPreferences(Context.MODE_PRIVATE)
        sharedPreferences?.edit()?.putBoolean(getString(R.string.has_accepted_terms_key), true)?.apply()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
