package ee.ttu.huvolk.speechdatacollection.network.data

import com.google.gson.annotations.SerializedName

data class Prompt(
    @SerializedName("prompt_id")
    val promptId: Int? = null,

    @SerializedName("project_id")
    val projectId: Int? = null,

    @SerializedName("description")
    val description: String? = null,

    @SerializedName("image_data")
    val imageData: String? = null,

    @SerializedName("created_at")
    val createdAt: String? = null,

    @SerializedName("instructions")
    val instructions: String? = null
)
