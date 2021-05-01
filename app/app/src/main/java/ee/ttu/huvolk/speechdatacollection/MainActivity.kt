package ee.ttu.huvolk.speechdatacollection

import android.content.Context
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.navigation.fragment.NavHostFragment
import ee.ttu.huvolk.speechdatacollection.databinding.ActivityMainBinding
import ee.ttu.huvolk.speechdatacollection.network.BackendService
import java.util.*

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        if (!isDeviceIdGenerated()) {
            generateDeviceId()
        }

        configureBackendService()
        createCustomNavGraph()
    }

    /**
     * Check if this device's unique identifier is present in the application's saved preferences.
     *
     * @return whether the unique identifier is generated or not
     */
    private fun isDeviceIdGenerated() : Boolean {
        return getDeviceId().isNotBlank();
    }

    /**
     * Get the generated unique identifier for this device from the application's saved preferences.
     *
     * @return this device's unique identifier from saved preferences
     */
    private fun getDeviceId(): String {
        val sharedPreferences = getPreferences(Context.MODE_PRIVATE)
        return sharedPreferences.getString(getString(R.string.device_id_key), "").toString()
    }

    /**
     * Generate a new unique unique identifier for this device and save it in application's preferences.
     */
    private fun generateDeviceId() {
        val sharedPreferences = getPreferences(Context.MODE_PRIVATE)
        val generatedDeviceId = UUID.randomUUID().toString()
        sharedPreferences.edit().putString(getString(R.string.device_id_key), generatedDeviceId).apply()
    }

    /**
     * Configure back-end service with parameters such as the API base URL and device ID.
     */
    private fun configureBackendService() {
        BackendService.baseUrl = getString(R.string.api_base_url)
        BackendService.deviceId = getDeviceId()
    }

    /**
     * Check if the user has already accepted the application's terms and if so, replace the
     * starting fragment in the navigation graph with the profile fragment (ie. skip the
     * welcome and terms screens). Note that the "app:navGraph" property must not be present
     * in the navigation graph xml file (as it is by default) in order to prevent creating
     * the navigation graph more than once.
     */
    private fun createCustomNavGraph() {
        val navHostFragment = (supportFragmentManager.findFragmentById(R.id.fContainer) as NavHostFragment)
        val navInflater = navHostFragment.navController.navInflater
        val navGraph = navInflater.inflate(R.navigation.nav_graph)

        if (hasAcceptedTerms()) {
            navGraph.startDestination = R.id.profileFragment
        }

        navHostFragment.navController.graph = navGraph
    }

    /**
     * Check if the user has accepted the application's terms.
     *
     * @return whether the user has accepted terms
     */
    private fun hasAcceptedTerms(): Boolean {
        val sharedPreferences = getPreferences(Context.MODE_PRIVATE)
        return sharedPreferences.getBoolean(getString(R.string.has_accepted_terms_key), false)
    }

    /**
     * Show or hide the sub-fragment of this activity.
     *
     * @param shown whether to show or hide the fragment
     */
    private fun setFragmentShown(shown: Boolean) {
        binding.llFragment.visibility = if (shown) View.VISIBLE else View.GONE
    }

    /**
     * Show or hide the loading progress bar icon.
     *
     * @param shown whether to show or hide the loading icon
     */
    private fun setLoadingIconShown(shown: Boolean) {
        binding.pbLoading.visibility = if (shown) View.VISIBLE else View.GONE
    }

    /**
     * Enable or disable the application's global loading state and indicator that
     * is shared between screens. Fragments will also be hidden during loading.
     */
    fun setIsLoading(isLoading: Boolean) {
        setFragmentShown(!isLoading)
        setLoadingIconShown(isLoading)
    }

    /**
     * Show an error message with a retry button in case the call to the back-end
     * API fails for example.
     *
     * @param shown whether to show the error message
     * @param errorMessage error message to show above the retry button
     */
    fun setErrorShown(shown: Boolean, errorMessage: String) {
        if (shown) {
            setIsLoading(false)
        }
        setFragmentShown(!shown)

        binding.tvErrorMessage.text = errorMessage
        binding.tvErrorMessage.visibility = if (shown) View.VISIBLE else View.GONE
    }

    /**
     * Set the title of the application that will be shown on the top below the system status bar.
     *
     * @param title title related to the current ongoing action or screen in the application
     */
    fun setTitle(title: String) {
        (this as AppCompatActivity).supportActionBar?.title = title
    }
}
