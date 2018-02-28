export default function sortPlayer (playerList) {
  return playerList.sort(function (a, b) {
    return parseInt(a.Identification) - parseInt(b.Identification)
  })
}
