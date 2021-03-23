package ee.ttu.huvolk.speechdatacollection.network

import com.google.gson.annotations.SerializedName

data class Profile(
    @SerializedName("year_of_birth")
    var yearOfBirth: Int? = null,

    @SerializedName("gender")
    var gender: String? = null,

    @SerializedName("native_language")
    var nativeLanguage: String? = null,

    @SerializedName("dialect")
    var dialect: String? = null
)