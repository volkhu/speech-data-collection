package ee.ttu.huvolk.speechdatacollection

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import ee.ttu.huvolk.speechdatacollection.MainActivity.ViewState
import ee.ttu.huvolk.speechdatacollection.databinding.FragmentWelcomeBinding

class WelcomeFragment : Fragment() {
    private var _binding: FragmentWelcomeBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentWelcomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        (activity as MainActivity).apply {
            setTitle(getString(R.string.title_welcome))
            setViewState(ViewState.FRAGMENT)
        }

        bindButtons()
    }

    /**
     * Add listeners to exit and next buttons to fulfill appropriate actions.
     */
    private fun bindButtons() {
        binding.btExit.setOnClickListener {
            activity?.finish()
        }

        binding.btNext.setOnClickListener {
            findNavController().navigate(R.id.action_welcomeFragment_to_termsFragment)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
