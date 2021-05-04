package ee.ttu.huvolk.speechdatacollection.fragments.projects

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.os.bundleOf
import androidx.navigation.findNavController
import androidx.recyclerview.widget.RecyclerView
import ee.ttu.huvolk.speechdatacollection.R
import ee.ttu.huvolk.speechdatacollection.network.data.Project

class ProjectSelectionAdapter(
    var projects: List<Project>
) : RecyclerView.Adapter<ProjectSelectionAdapter.ProjectSelectionViewHolder>() {

    inner class ProjectSelectionViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProjectSelectionViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_project_selection, parent, false)
        val holder = ProjectSelectionViewHolder(view)

        holder.itemView.setOnClickListener {
            // expand the clicked item and collapse others
            val itemPosition = holder.adapterPosition
            projects.forEachIndexed { index, project ->
                project.expanded = index == itemPosition && !project.expanded
            }

            notifyDataSetChanged()
        }

        holder.itemView.findViewById<Button>(R.id.btStartRecording).setOnClickListener {
            val itemPosition = holder.adapterPosition
            val projectId = projects[itemPosition].projectId
            val projectTitle = projects[itemPosition].name

            val bundle = bundleOf("projectId" to projectId, "projectTitle" to projectTitle)
            parent.findNavController().navigate(R.id.action_projectSelectionFragment_to_recordingFragment, bundle)

        }

        return holder
    }

    /**
     * Calculate the ratio of completed prompts and total amount of prompts in a project
     * to show the associated progress bar indicator to the user.
     *
     * @param project project whose completion percentage to calculate
     *
     * @return completion percentage of a project as an integer
     */
    private fun calculateCompletionPercentage(project: Project): Int {
        if ((project.numActiveSessions == null || project.numActiveSessions == 0)
                && project.numSessionsCompleted != null && project.numSessionsCompleted > 0) {
            // user has not done anything with a new session, but has completed
            // this project in the past, so mark it as completed
            return 100
        }

        var completionPercentage = 0
        if (project.numRecordingsInActiveSession != null
                && project.numPrompts != null
                && project.numPrompts > 0) {
            completionPercentage = kotlin.math.floor((project.numRecordingsInActiveSession.toDouble() / project.numPrompts) * 100).toInt()
        }

        return completionPercentage
    }

    /**
     * Set the properties of each rendered item in the list.
     */
    override fun onBindViewHolder(holder: ProjectSelectionViewHolder, position: Int) {
        val project = projects[position]
        val completionPercentage = calculateCompletionPercentage(projects[position])

        // set project status text and indicators
        var statusText = holder.itemView.context.getString(R.string.project_status, completionPercentage)
        if (project.allowRepeatedSessions == true) {
            statusText += " " + holder.itemView.context.getString(R.string.project_can_be_repeated)
        }
        holder.itemView.findViewById<TextView>(R.id.tvProjectStatus).text = statusText
        holder.itemView.findViewById<ProgressBar>(R.id.pbProjectCompletion).progress = completionPercentage

        // set title and description
        val descriptionText = holder.itemView.context.getString(
            R.string.project_description,
            project.numPrompts,
            project.numSessionsCompleted,
            project.description)
        holder.itemView.findViewById<TextView>(R.id.tvProjectTitle).text = project.name
        holder.itemView.findViewById<TextView>(R.id.tvProjectDescription).text = descriptionText

        // hide or show the expanded details
        val clProjectExtraDetails = holder.itemView.findViewById<ConstraintLayout>(R.id.clProjectExtraDetails)
        clProjectExtraDetails.visibility = if (project.expanded) View.VISIBLE else View.GONE

        // rotate the expand icon up/down accordingly
        val rotation = if (projects[position].expanded) 270.0f else 90.0f
        holder.itemView.findViewById<ImageView>(R.id.ivSelectIcon).rotation = rotation
    }

    override fun getItemCount(): Int {
        return projects.size
    }
}
