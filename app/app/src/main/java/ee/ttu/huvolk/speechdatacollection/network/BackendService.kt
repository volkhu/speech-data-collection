package ee.ttu.huvolk.speechdatacollection.network

import retrofit2.Call
import retrofit2.http.*

interface BackendService {
    @GET("/api/profiles")
    fun getProfile(@Header("X-DeviceId") deviceId: String): Call<Profile>

    @POST("/api/profiles")
    fun postProfile(@Header("X-DeviceId") deviceId: String, @Body profileData: Profile): Call<PostProfileResponse>

    @GET("/api/projects")
    fun getProjects(@Header("X-DeviceId") deviceId: String): Call<List<Project>>

    @GET("/api/projects/{projectId}/prompt")
    fun getPrompt(@Header("X-DeviceId") deviceId: String, @Path("projectId") projectId: Int): Call<Prompt>

    @POST("/api/recordings")
    fun postRecording(@Header("X-DeviceId") deviceId: String, @Body recordingData: Recording): Call<PostRecordingResponse>
}
