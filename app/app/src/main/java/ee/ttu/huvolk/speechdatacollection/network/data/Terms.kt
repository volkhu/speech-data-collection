package ee.ttu.huvolk.speechdatacollection.network.data

import com.google.gson.annotations.SerializedName

data class Terms(
    @SerializedName("mobile_app_terms")
    var mobileAppTerms: String? = null
)
