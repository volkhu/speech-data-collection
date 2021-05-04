package ee.ttu.huvolk.speechdatacollection.network.data

import com.google.gson.annotations.SerializedName

data class Project(
    @SerializedName("project_id")
    val projectId: Int? = null,

    @SerializedName("name")
    val name: String? = null,

    @SerializedName("description")
    val description: String? = null,

    @SerializedName("num_prompts")
    val numPrompts: Int? = null,

    @SerializedName("num_recordings_in_active_session")
    val numRecordingsInActiveSession: Int? = null,

    @SerializedName("num_active_sessions")
    val numActiveSessions: Int? = null,

    @SerializedName("num_sessions_completed")
    val numSessionsCompleted: Int? = null,

    @SerializedName("allow_repeated_sessions")
    val allowRepeatedSessions: Boolean? = null,

    var expanded: Boolean = false
)
