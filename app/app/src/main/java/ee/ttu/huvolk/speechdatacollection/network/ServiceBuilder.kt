package ee.ttu.huvolk.speechdatacollection.network

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object ServiceBuilder {
    val retrofit = Retrofit.Builder()
        .baseUrl("https://example.com/")
        //.baseUrl("http://192.168.1.2:5000/")
        .addConverterFactory(GsonConverterFactory.create())
        .build();

    fun buildBackendService(): BackendService {
        return retrofit.create(BackendService::class.java)
    }
}
