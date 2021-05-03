package ee.ttu.huvolk.speechdatacollection.network.data

import com.google.gson.annotations.SerializedName

data class PostRecordingResponse(
    @SerializedName("recording_id")
    var recordingId: Int? = null
)
