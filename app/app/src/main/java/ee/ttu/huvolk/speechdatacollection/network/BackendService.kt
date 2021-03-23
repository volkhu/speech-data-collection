package ee.ttu.huvolk.speechdatacollection.network

import retrofit2.Call
import retrofit2.http.*

interface BackendService {
    @GET("/api/profiles")
    fun getProfile(@Header("X-DeviceId") deviceId: String): Call<Profile>

    @POST("/api/profiles")
    fun postProfile(@Header("X-DeviceId") deviceId: String, @Body profileData: Profile): Call<PostProfileResponse>

    @GET("/api/projects")
    fun getProjects(): Call<List<Project>>

    @POST("/api/sessions")
    fun postSession(@Header("X-DeviceId") deviceId: String, @Body sessionData: Session): Call<PostSessionResponse>

    @GET("/api/sessions/rprompt")
    fun getRandomPrompt(@Query("pid") pid: Int): Call<Prompt>
}
