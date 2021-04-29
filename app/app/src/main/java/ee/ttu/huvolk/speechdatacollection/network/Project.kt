package ee.ttu.huvolk.speechdatacollection.network

import com.google.gson.annotations.SerializedName

data class Project(
    @SerializedName("project_id")
    val projectId: Int? = null,

    @SerializedName("name")
    val name: String? = null,

    @SerializedName("active")
    val active: Boolean? = null,

    @SerializedName("randomize_prompt_order")
    val randomizePromptOrder: Boolean? = null,

    @SerializedName("allow_repeated_sessions")
    val allowRepeatedSessions: Boolean? = null,

    @SerializedName("sessions_in_progress")
    val sessionsInProgress: Int? = null,

    @SerializedName("sessions_completed")
    val sessionsCompleted: Int? = null,

    @SerializedName("created_at")
    val createdAt: String? = null,

    @SerializedName("description")
    val description: String? = null
)
