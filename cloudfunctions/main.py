import sqlalchemy
import io
import environ
import google.auth
from google.cloud import secretmanager

_, project = google.auth.default()
settingsName = "dbconnect_settings"
client = secretmanager.SecretManagerServiceClient()
keyName = f"projects/{project}/secrets/{settingsName}/versions/latest"
payload = client.access_secret_version(name=keyName).payload.data.decode("UTF-8")

env = environ.Env()
env.read_env(io.StringIO(payload))

dbName = env("DB_NAME")
dbUser = env("DB_USER")
dbPassword = env("DB_PASSWORD")
connectionName = env("CONNECTION_NAME")
functionPassword = env("FUNCTION_PASSWORD")

driverName = 'postgres+pg8000'
queryString =  dict({"unix_sock": "/cloudsql/{}/.s.PGSQL.5432".format(connectionName)})

def update(request):
  jsonRequest = request.get_json()
  result = 'Unknown'

  if jsonRequest['password'] != functionPassword:
    print('Unauthorized')
    return 'Unauthorized'

  if jsonRequest['operation'] == 'insert' and jsonRequest['rip']['videoId'] == 'Unknown':
    print('Unknown ID')
    return 'Unknown ID'

  db = sqlalchemy.create_engine(
    sqlalchemy.engine.url.URL(
      drivername = driverName,
      username = dbUser,
      password = dbPassword,
      database = dbName,
      query = queryString,
    ),
    pool_size = 5,
    max_overflow = 2,
    pool_timeout = 30,
    pool_recycle = 1800
  )

  try:
    with db.connect() as conn:
      if jsonRequest['operation'] == 'insert':
        rip = jsonRequest['rip']
        conn.execute(
          '''
            Insert into Rips_rip ("videoId", title, slug, "wikiStatus", "videoStatus", "uploadDate", description, length,
                                  "viewCount", "likeCount", "dislikeCount", "commentCount", channel_id, author_id, visible, "addDate")
            Values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 2, TRUE, current_timestamp);
          ''',
          (
            rip['videoId'], rip['title'], rip['videoId'], rip['wikiStatus'], rip['videoStatus'], rip['uploadDate'], rip['description'],
            rip['length'] , rip['viewCount'], rip['likeCount'], rip['dislikeCount'], rip['commentCount'], rip['channelId']
          )
        )
        result = 'Successfully inserted ' + rip['videoId']

      elif jsonRequest['operation'] == 'update':
        rips = jsonRequest['rips']
        for rip in rips:
          if rip['videoId'] != 'Unknown':
            conn.execute(
              '''
                Update Rips_rip
                Set (title, "wikiStatus", "videoStatus", description, "viewCount", "likeCount", "dislikeCount", "commentCount") =
                    (%s, %s, %s, %s, %s, %s, %s, %s)
                Where "videoId" = %s;
              ''',
              (
                rip['title'], rip['wikiStatus'], rip['videoStatus'], rip['description'],
                rip['viewCount'], rip['likeCount'], rip['dislikeCount'], rip['commentCount'], rip['videoId']
              )
            )
        result = 'Successfully updated ' + str(len(rips)) + ' rips'

      elif jsonRequest['operation'] == 'check':
        missingVideoIds = []
        sheetVideoIds = jsonRequest['videoIds']
        dbVideoIdsObj = conn.execute('Select "videoId" from Rips_rip where channel_id = %s;', (jsonRequest['channelId']))
        dbVideoIdsArr = []
        for dbVideoId in dbVideoIdsObj:
          dbVideoIdsArr.append(dbVideoId['videoId'])
        for sheetVideoId in sheetVideoIds:
          if sheetVideoId not in dbVideoIdsArr:
            missingVideoIds.append(sheetVideoId)
        result = 'Missing IDs: ' + ', '.join(missingVideoIds)

  except Exception as e:
    result = 'Error: {}'.format(str(e))

  print(result)
  return result
