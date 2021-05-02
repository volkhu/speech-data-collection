package ee.ttu.huvolk.speechdatacollection

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.LinearLayoutManager
import ee.ttu.huvolk.speechdatacollection.MainActivity.ViewState
import ee.ttu.huvolk.speechdatacollection.databinding.FragmentProjectSelectionBinding
import ee.ttu.huvolk.speechdatacollection.network.BackendService
import ee.ttu.huvolk.speechdatacollection.network.Project
import ee.ttu.huvolk.speechdatacollection.projectselection.ProjectSelectionAdapter
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ProjectSelectionFragment : Fragment() {
    private var _binding: FragmentProjectSelectionBinding? = null
    private val binding get() = _binding!!

    private var loadProjectsCall: Call<List<Project>>? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProjectSelectionBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        (activity as MainActivity).setTitle(getString(R.string.title_project_selection))
        bindElements()
        loadProjects()
    }

    /**
     * Bind fragment elements such as swipe refresh to their appropriate actions.
     */
    private fun bindElements() {
        binding.srlProjectsSelection.setOnRefreshListener {
            // disable the built-in loader since we're using our own
            binding.srlProjectsSelection.isRefreshing = false
            loadProjects()
        }
    }

    /**
     * Load the list of projects available to the user from the back-end API service.
     */
    private fun loadProjects() {
        (activity as MainActivity).setViewState(ViewState.LOADING)

        loadProjectsCall = BackendService.service.getProjects()
        loadProjectsCall?.enqueue(object : Callback<List<Project>> {
            override fun onResponse(call: Call<List<Project>>, response: Response<List<Project>>) {
                val projects = response.body()

                if (response.code() == 200 && projects != null) {
                    val adapter = ProjectSelectionAdapter(projects)
                    binding.rvProjectSelection.adapter = adapter
                    binding.rvProjectSelection.layoutManager = LinearLayoutManager(context)

                    (activity as MainActivity).setViewState(ViewState.FRAGMENT)
                } else {
                    onLoadProjectsFailed("Code " + response.code() + ": " + response.message())
                }
            }

            override fun onFailure(call: Call<List<Project>>, t: Throwable) {
                if (loadProjectsCall?.isCanceled == false) {
                    onLoadProjectsFailed(t.message.toString())
                }
            }
        })
    }

    /**
     * Show user an error if loading the projects list fails for any reason.
     *
     * @param errorMessage error message to show to the user
     */
    private fun onLoadProjectsFailed(errorMessage: String) {
        (activity as MainActivity).setViewState(ViewState.ERROR, errorMessage) {
            if (activity != null) {
                loadProjects()
            }
        }
    }

    override fun onDestroyView() {
        loadProjectsCall?.cancel()

        super.onDestroyView()
        _binding = null
    }
}