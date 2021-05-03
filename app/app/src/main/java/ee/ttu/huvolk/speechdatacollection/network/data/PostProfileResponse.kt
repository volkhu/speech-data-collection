package ee.ttu.huvolk.speechdatacollection.network.data

import com.google.gson.annotations.SerializedName

data class PostProfileResponse(
    @SerializedName("profile_id")
    val profileId: String? = null
)
