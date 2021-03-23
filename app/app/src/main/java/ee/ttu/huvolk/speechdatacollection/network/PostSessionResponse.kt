package ee.ttu.huvolk.speechdatacollection.network

import com.google.gson.annotations.SerializedName

data class PostSessionResponse(
    @SerializedName("session_id")
    val sessionId: Int? = null
)
