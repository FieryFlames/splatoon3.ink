import StatusGenerator from "./StatusGenerator.mjs";
import Media from "../Media.mjs";
import { useSalmonRunSchedulesStore } from "../../../src/stores/schedules.mjs";
import { useTimeStore } from "../../../src/stores/time.mjs";

export default class SalmonRunUpcomingStatus extends StatusGenerator
{
  key = 'salmonrun.upcoming';
  name = 'Upcoming Salmon Run';

  async getActiveSchedule() {
    await this.preparePinia();

    // Look for any interesting upcoming schedules
    return useSalmonRunSchedulesStore().currentSchedules.find(
      s => s.isBigRun
      || s.isMystery
      || s.isGrizzcoMystery
    );
  }

  async getDataTime() {
    let schedule = await this.getActiveSchedule();

    return schedule
      ? Date.parse(schedule.startTime)
      : false;
  }

  _getDescription(schedule) {
    switch (true) {
      case schedule.isBigRun:
        return `A BIG RUN shift has been added to the schedule! #salmonrun #splatoon3`;
      case schedule.isGrizzcoMystery:
        return `A Salmon Run shift with GRIZZCO MYSTERY WEAPONS has been added to the schedule! #salmonrun #splatoon3`;
      case schedule.isMystery:
        return `A Salmon Run shift with MYSTERY WEAPONS has been added to the schedule! #salmonrun #splatoon3`;
    }
  }

  async _getStatus() {
    let schedule = await this.getActiveSchedule();

    if (!schedule) {
      return false;
    }

    let lines = [];

    lines.push(this._getDescription(schedule));
    lines.push('');

    let startTime = Date.parse(schedule.startTime);
    let now = useTimeStore().now;
    let hours = Math.min((startTime - now) / (1000 * 60 * 60));
    hours = hours === 1 ? '1 hour' : `${hours} hours`;

    lines.push(`In ${hours} this shift will begin on ${schedule.settings.coopStage.name} with:`);
    lines.push(...schedule.settings.weapons.map(w => `– ${w.name}`));

    return lines.join('\n');
  }

  /** @param {ScreenshotHelper} screenshotHelper */
  async _getMedia(screenshotHelper) {
    let schedule = await this.getActiveSchedule();

    let media = new Media;
    media.file = await screenshotHelper.capture('salmonrun', {
      params: { startTime: schedule?.startTime },
    });

    return media;
  }
}