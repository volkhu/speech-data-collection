package ee.ttu.huvolk.speechdatacollection.network

import okhttp3.Interceptor
import okhttp3.OkHttpClient
import retrofit2.Call
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*

interface BackendService {
    @GET("profiles")
    fun getProfile(): Call<Profile>

    @POST("profiles")
    fun postProfile(@Body profileData: Profile): Call<PostProfileResponse>

    @GET("projects")
    fun getProjects(): Call<List<Project>>

    @GET("projects/{projectId}/prompt")
    fun getPrompt(@Path("projectId") projectId: Int): Call<Prompt>

    @POST("recordings")
    fun postRecording(@Body recordingData: Recording): Call<PostRecordingResponse>

    companion object {
        lateinit var baseUrl: String
        lateinit var deviceId: String

        val service: BackendService by lazy {
            BackendService.build()
        }

        /**
         * Create retrofit instance to connect to back-end API.
         */
        private fun build(): BackendService {
            val client = OkHttpClient().newBuilder().addInterceptor(Interceptor {
                chain ->
                chain.proceed(chain.request().newBuilder()
                        .addHeader("X-DeviceId", deviceId).build())
            }).build()

            val retrofit = Retrofit.Builder()
                    .baseUrl(baseUrl)
                    .client(client)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();

            return retrofit.create(BackendService::class.java)
        }
    }
}
