import { FileConfigStore } from '../infra/config/file-config.store.js'
import { getDoctorReport as getDoctorReportUseCase } from '../app/use-cases/doctor/get-doctor-report.js'

export type { DoctorCheckStatus, DoctorCheck, DoctorReport } from '../domain/doctor/report.js'

export const getDoctorReport = () => getDoctorReportUseCase(new FileConfigStore())
