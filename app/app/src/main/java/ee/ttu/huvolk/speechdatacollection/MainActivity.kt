package ee.ttu.huvolk.speechdatacollection

import android.content.Context
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.appcompat.app.AlertDialog
import androidx.navigation.findNavController
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.fragment.findNavController
import ee.ttu.huvolk.speechdatacollection.databinding.ActivityMainBinding
import ee.ttu.huvolk.speechdatacollection.network.BackendService
import java.util.*

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    enum class ViewState {
        FRAGMENT,
        LOADING,
        ERROR
    }

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
     * Set this main activity to either show the current view's fragment,
     * a loading icon, or an error page.
     *
     * @param viewState show either the fragment, loading icon or error page
     * @param message error message to display if on the error page
     * @param actionCallback function to be called when user presses the
     * retry button on the error page
     */
    fun setViewState(viewState: ViewState, message: String? = null, actionCallback: (() -> Unit)? = null) {
        when (viewState) {
            ViewState.FRAGMENT -> {
                binding.llFragment.visibility = View.VISIBLE
                binding.pbLoading.visibility = View.GONE
                binding.llError.visibility = View.GONE
            }
            ViewState.LOADING -> {
                binding.llFragment.visibility = View.GONE
                binding.pbLoading.visibility = View.VISIBLE
                binding.llError.visibility = View.GONE
            }
            ViewState.ERROR -> {
                binding.llFragment.visibility = View.GONE
                binding.pbLoading.visibility = View.GONE
                binding.tvErrorMessage.text = getString(R.string.an_error_has_occurred, message)
                binding.llError.visibility = View.VISIBLE

                binding.btRetry.setOnClickListener {
                    if (actionCallback != null) {
                        actionCallback()
                    }
                }
            }
        }
    }

    /**
     * Set the title of the application that will be shown on the top below the system status bar.
     *
     * @param title title related to the current ongoing action or screen in the application
     */
    fun setTitle(title: String) {
        (this as AppCompatActivity).supportActionBar?.title = title
    }

    /**
     * Show an exit dialog to user with yes/no options to make sure that they
     * don't accidentally exit the application. This may also be called from
     * sub-fragments when for example a dedicated exit button is present.
     */
    fun showExitDialog() {
        val builder = AlertDialog.Builder(this)
        builder.setIcon(R.mipmap.ic_launcher)
        builder.setTitle(R.string.app_name)
        builder.setMessage(R.string.exit_confirmation_message)

        builder.setPositiveButton(R.string.yes) { _, _ ->
            finish()
        }

        builder.setNegativeButton(R.string.no) { dialog, _ ->
            dialog.cancel()
        }

        builder.show()
    }
}
