const dateFns = require("date-fns");

export default {
  methods: {
    /**
     * Format the datetime string from JSON files into a
     * human readable format.
     *
     * @param dateTimeString datetime string to format
     * @returns equivalent human readable time string in the format of dd.MM.yyyy HH:mm
     */
    formatDateTime(dateTimeString) {
      try {
        return dateFns.format(
          dateFns.parseJSON(dateTimeString),
          "dd.MM.yyyy HH:mm"
        );
      } catch (error) {
        return "-";
      }
    },

    /**
     * Format a numeric value of seconds by limiting the amount of decimal places and
     * handling the null case.
     *
     * @param secondsNumber unformatted seconds as a decimal
     * @returns string representing a human readable value of the input,
     * 0.00 in case of null and a dash in case of other errors
     */
    formatSeconds(secondsNumber) {
      if (secondsNumber == null) {
        return "0.00";
      }

      try {
        return secondsNumber.toFixed(2);
      } catch (error) {
        return "-";
      }
    },
  },
};
