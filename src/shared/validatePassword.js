var validate = {
  validPassword(password) {
    var regex = new RegExp(
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{12,}$'
    )
    return regex.test(password)
  }
}

export default validate
