package ee.ttu.huvolk.speechdatacollection.projectselection

import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.os.bundleOf
import androidx.navigation.findNavController
import androidx.recyclerview.widget.RecyclerView
import ee.ttu.huvolk.speechdatacollection.R
import ee.ttu.huvolk.speechdatacollection.network.Project

class ProjectSelectionAdapter(
    var projects: List<Project>
) : RecyclerView.Adapter<ProjectSelectionAdapter.ProjectSelectionViewHolder>() {

    inner class ProjectSelectionViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProjectSelectionViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_project_selection, parent, false)
        val holder = ProjectSelectionViewHolder(view)

        holder.itemView.setOnClickListener {
            val itemPosition = holder.adapterPosition
            Log.d("ProjectSelectionAdapter", "Clicked " + itemPosition)

            val projectId = projects[itemPosition].projectId
            val projectTitle = projects[itemPosition].name

            val bundle = bundleOf("projectId" to projectId, "projectTitle" to projectTitle)
            parent.findNavController().navigate(R.id.action_projectSelectionFragment_to_recordingFragment, bundle)
        }

        return holder
    }

    override fun onBindViewHolder(holder: ProjectSelectionViewHolder, position: Int) {
        holder.itemView.findViewById<TextView>(R.id.tvProjectTitle).text = projects[position].name
        holder.itemView.findViewById<TextView>(R.id.tvProjectDescription).text = projects[position].description
    }

    override fun getItemCount(): Int {
        return projects.size
    }
}
