package ee.ttu.huvolk.speechdatacollection.network

import com.google.gson.annotations.SerializedName

data class Terms(
    @SerializedName("mobile_app_terms")
    var mobileAppTerms: String? = null
)
