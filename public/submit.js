$(document).ready(function() {
  function reload() {
    $.get('/', function(date) {
      console.log("Reloaded!");
    });
  }

  $('#add-msg').submit(function(e) {
    e.preventDefault();

    $.ajax({
      url: '/add',
      type: 'PUT',
      data: $(this).serialize(),
      success: function(data) {
        console.log(data);
        reload();
      }
    });
  });
});
