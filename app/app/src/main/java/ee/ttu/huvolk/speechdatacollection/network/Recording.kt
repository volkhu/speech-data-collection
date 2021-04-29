package ee.ttu.huvolk.speechdatacollection.network

import com.google.gson.annotations.SerializedName

data class Recording(
    @SerializedName("project_id")
    var projectId: Int? = null,

    @SerializedName("prompt_id")
    var promptId: Int? = null,

    @SerializedName("recorded_file")
    var recordedFile: String? = null,

    @SerializedName("duration_in_seconds")
    var durationInSeconds: Float? = null
)
