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

    @SerializedName("allow_concurrent_sessions")
    val allowConcurrentSessions: Boolean? = null,

    @SerializedName("created_at")
    val createdAt: String? = null,

    @SerializedName("description")
    val description: String? = null
)
