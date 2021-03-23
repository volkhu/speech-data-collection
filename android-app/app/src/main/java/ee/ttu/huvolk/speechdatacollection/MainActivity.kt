package ee.ttu.huvolk.speechdatacollection

import android.content.Context
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.navigation.fragment.NavHostFragment
import ee.ttu.huvolk.speechdatacollection.databinding.ActivityMainBinding
import java.util.*

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        generateDeviceId()
        Log.d("MainActivity", "Device Id = " + getDeviceId())
        createCustomNavGraph()
    }

    private fun generateDeviceId() {
        if (getDeviceId().isBlank()) {
            val sharedPreferences = getPreferences(Context.MODE_PRIVATE)
            val generatedDeviceId = UUID.randomUUID().toString()
            sharedPreferences.edit().putString(getString(R.string.device_id_key), generatedDeviceId).apply()
        }
    }

    fun getDeviceId(): String {
        val sharedPreferences = getPreferences(Context.MODE_PRIVATE)
        return sharedPreferences.getString(getString(R.string.device_id_key), "").toString()
    }

    // Set the app start fragment to profile if the user has already accepted the terms
    // (skip welcome and terms fragments)
    // app:navGraph="@navigation/nav_graph" must not be in activity_main.xml fragment element
    // to avoid creating navGraph twice
    private fun createCustomNavGraph() {
        val navHostFragment = (supportFragmentManager.findFragmentById(R.id.fContainer) as NavHostFragment)
        val navInflater = navHostFragment.navController.navInflater
        val navGraph = navInflater.inflate(R.navigation.nav_graph)

        if (hasAcceptedTerms()) {
            navGraph.startDestination = R.id.profileFragment
        }

        navHostFragment.navController.graph = navGraph
    }

    private fun hasAcceptedTerms(): Boolean {
        val sharedPreferences = getPreferences(Context.MODE_PRIVATE)
        return sharedPreferences.getBoolean(getString(R.string.has_accepted_terms_key), false)
    }

    fun enableLoadingIcon() {
        binding.pbLoading.visibility = View.VISIBLE
    }

    fun disableLoadingIcon() {
        binding.pbLoading.visibility = View.GONE
    }
}