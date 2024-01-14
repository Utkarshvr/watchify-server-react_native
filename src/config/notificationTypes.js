const notificationTypes = {
  videoUpload: {
    root: "VIDEO-UPLOAD-",
    inProgress: function () {
      return this.root + "INPROGRESS";
    },
    success: function () {
      return this.root + "SUCCESS";
    },
    failed: function () {
      return this.root + "FAILED";
    },
  },
  contentFetch: {
    root: "CONTENT-FETCH-",
    success: function () {
      return this.root + "SUCCESS";
    },
    failed: function () {
      return this.root + "FAILED";
    },
    unauthorized: function () {
      return this.root + "UNAUTHORIZED";
    },
  },
};

module.exports = notificationTypes;
