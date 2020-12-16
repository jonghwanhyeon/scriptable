class TimeDelta {
  constructor({days = 0, hours = 0, minutes = 0, seconds = 0} = {}) {
    if (typeof arguments[0] === 'number') {
      let time = arguments[0] / 1000;
      days = Math.floor(time / (24 * 60 * 60));

      time -= (24 * 60 * 60) * days;
      hours = Math.floor(time / (60 * 60));
      
      time -= (60 * 60) * hours;
      minutes = Math.floor(time / 60);
      
      time -= 60 * minutes;
      seconds = time;
    }

    this.days = days;
    this.hours = hours;
    this.minutes = minutes;
    this.seconds = seconds;
  }

  getTime() {
    return (
      (24 * 60 * 60) * this.days
      + (60 * 60) * this.hours
      + 60 * this.minutes
      + this.seconds
    ) * 1000;
  }

  equals(operand) {
    return (
      (this.days === operand.days)
      && (this.hours === operand.hours)
      && (this.minutes === operand.minutes)
      && (this.seconds === operand.seconds)
    );
  }

  dateAfter(date = new Date()) {
    return new Date(date.getTime() + this.getTime());
  }

  dateBefore(date = new Date()) {
    return new TimeDelta({
      days: -this.days,
      hours: -this.hours,
      minutes: -this.minutes,
      seconds: -this.seconds,
    }).dateAfter(date);
  }
}

module.exports = {
  TimeDelta,

  after(left, right) {
      return left.getTime() >= right.getTime();
  },
  before(left, right) {
      return left.getTime() < right.getTime();
  },
  passed(operand) {
      return this.after(new Date(), operand);
  },
  min(left, right) {
    return (left.getTime() <= right.getTime()) ? left : right;
  },
  max(left, right) {
    return (left.getTime() > right.getTime()) ? left : right;
  },
  dateAfter({days = 0, hours = 0, minutes = 0, seconds = 0} = {}) {
    return new TimeDelta({days, hours, minutes, seconds}).dateAfter();
  },
  dateBefore({days = 0, hours = 0, minutes = 0, seconds = 0} = {}) {
    return this.dateAfter({
      days: -days,
      hours: -hours,
      minutes: -minutes,
      seconds: -seconds,
    });
  },
  format(format, date = new Date) {
    const formatter = new DateFormatter();
    formatter.dateFormat = format;
    return formatter.string(date);
  },
};