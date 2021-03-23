package ee.ttu.huvolk.speechdatacollection.network

import com.google.gson.annotations.SerializedName

data class Session(
    @SerializedName("project_id")
    val projectId: Int? = null
)
