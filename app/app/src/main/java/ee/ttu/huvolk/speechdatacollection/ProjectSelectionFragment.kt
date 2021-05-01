package ee.ttu.huvolk.speechdatacollection

import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import ee.ttu.huvolk.speechdatacollection.databinding.FragmentProjectSelectionBinding
import ee.ttu.huvolk.speechdatacollection.network.Project
import ee.ttu.huvolk.speechdatacollection.network.ServiceBuilder
import ee.ttu.huvolk.speechdatacollection.projectselection.ProjectSelectionAdapter
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ProjectSelectionFragment : Fragment() {
    private var _binding: FragmentProjectSelectionBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentProjectSelectionBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.visibility = View.INVISIBLE
        (activity as MainActivity).setIsLoading(true)
        (activity as AppCompatActivity).supportActionBar?.title = getString(R.string.title_project_selection)

        val api = ServiceBuilder.buildBackendService()
        api.getProjects(deviceId = (activity as MainActivity).getDeviceId()).enqueue(object : Callback<List<Project>> {
            override fun onResponse(call: Call<List<Project>>, response: Response<List<Project>>) {
                (activity as MainActivity).setIsLoading(false)
                view.visibility = View.VISIBLE

                if (response.code() == 200) {
                    Log.d("PSelectionFragment", "Got response code 200, can list projects, size: " + response.body()?.size)

                    val adapter = ProjectSelectionAdapter(response.body()!!)
                    binding.rvProjectSelection.adapter = adapter
                    binding.rvProjectSelection.layoutManager = LinearLayoutManager(context)

                } else {
                    Log.d("PSelectionFragment", "Unknown successful response: $response")
                }
            }

            override fun onFailure(call: Call<List<Project>>, t: Throwable) {
                Log.d("PSelectionFragment", "Got failure: " + t.message)
            }
        })
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}