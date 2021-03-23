package ee.ttu.huvolk.speechdatacollection.network

import com.google.gson.annotations.SerializedName

data class PostProfileResponse(
    @SerializedName("profile_id")
    val profileId: String? = null
)
