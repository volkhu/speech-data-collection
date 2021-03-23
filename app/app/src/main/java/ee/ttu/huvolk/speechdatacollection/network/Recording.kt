package ee.ttu.huvolk.speechdatacollection.network

import com.google.gson.annotations.SerializedName

data class Recording(
    @SerializedName("session_id")
    var sessionId: Int? = null,

    @SerializedName("prompt_id")
    var promptId: Int? = null,

    @SerializedName("recorded_file")
    var recordedFile: String? = null
)
