const dateFns = require("date-fns");

export default {
  methods: {
    formatDateTime(dateTimeString) {
      try {
        return dateFns.format(
          dateFns.parseJSON(dateTimeString),
          "dd.MM.yyyy hh:mm"
        );
      } catch (error) {
        return "-";
      }
    },

    formatSeconds(secondsNumber) {
      try {
        return secondsNumber.toFixed(2);
      } catch (error) {
        return "-";
      }
    },
  },
};
