package ee.ttu.huvolk.speechdatacollection.network.data

import com.google.gson.annotations.SerializedName

data class Session(
    @SerializedName("project_id")
    val projectId: Int? = null
)
