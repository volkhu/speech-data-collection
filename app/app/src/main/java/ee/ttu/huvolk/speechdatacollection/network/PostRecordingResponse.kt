package ee.ttu.huvolk.speechdatacollection.network

import com.google.gson.annotations.SerializedName

data class PostRecordingResponse(
    @SerializedName("recording_id")
    var recordingId: Int? = null
)
