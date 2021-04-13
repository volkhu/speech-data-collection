const dateFns = require("date-fns");

export default {
  methods: {
    formatDateTime(dateTimeString) {
      return dateFns.format(
        dateFns.parseJSON(dateTimeString),
        "dd.MM.yyyy hh:mm"
      );
    },
  },
};
