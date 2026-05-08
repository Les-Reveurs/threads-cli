import pc from 'picocolors'
import type { ManageReplyResult, ThreadsRepliesListResult, ThreadsReply } from '../../domain/replies/reply.js'

const renderReplyLine = (reply: ThreadsReply): string => [
  `- id: ${reply.id}`,
  `  username: ${reply.username ?? '-'}`,
  `  text: ${reply.text ?? '-'}`,
  `  hidden: ${reply.hide_status ?? '-'}`,
  `  timestamp: ${reply.timestamp ?? '-'}`,
].join('\n')

export const renderRepliesList = (result: ThreadsRepliesListResult): string => [
  pc.green(`replies list: ${result.data.length} item(s)`),
  ...result.data.map(renderReplyLine),
  `next_after: ${result.paging?.cursors?.after ?? '-'}`,
].join('\n')

export const renderReplyManaged = (result: ManageReplyResult): string => [
  pc.green(`reply ${result.hidden ? 'hide' : 'unhide'}: done`),
  `id: ${result.id}`,
  `hidden: ${result.hidden}`,
].join('\n')
