## Assistant

#### Register

`POST /api/users/register`

```
# request body
{
  "code",
  "email",
  "role",
  "password",
  "phone"
}
```

```
# response body
{
  "_id",
  "name",
  "phone",
  "teacherId",
  "date"
}
```

#### Login

`POST /api/users/login`

```
# request body
{
  "email",
  "password",
}
```

```
# response body
{
  "_id",
  "role",
  "isAdmin",
  "date"
}

# response headers
"x-auth-token"
```

## Group

### Show all groups

`GET /api/groups?day=sat` or `GET /api/groups`
If day is not passed or was given a wrong value all the groups are gonna be shown, othewise the groups
of the given day only are gonna be shown

```
# req GET /api/groups?day=sat
[
  {
    "attendance_record": {
      "number": 0,
      "details": []
    },
    "students": {
      "number": 0,
      "details": []
    },
    "_id": "d4ZsYxoWS",
    "name": "Group 1",
    "day": "sat",
    "teacherId": "IfqWZuiGL",
    "date": "2019-06-22T12:24:37.109Z",
    "__v": 0
  }
]
```

#### Create group

`POST /api/groups/create_group`

```
# req body
{
  "name",
  "day" # must be one of theses 'sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'
}
# req headers
"x-auth-token" -> of the assistant
```

```
# res body
{
  "attendance_record": {
    "number": 0,
    "details": []
  },
  "students": {
    "number": 0,
    "details": []
  },
  "name": "Group 1",
  "teacherId": "pBoI9qkMz",
  "_id": "zrHiAcc0v",
  "date": "2019-06-02T05:00:31.104Z",
  "__v": 0
}
```

#### Add student to group

`POST /api/groups/group_zrHiAcc0v/add_student`

```
# req body
{
  "name",
  "phone"
}
# req headers
"x-auth-token" -> of the assistant
```

```json
# res body

{
  "code"
}
```

#### Set new attendance record

`GET /api/groups/group_zrHiAcc0v/set_new_attendance_record`

```
# res body
{
  "_id",
  "date"
}
```

#### Recorde student attendance

`GET /api/groups/group_zrHiAcc0v/record_attendance/student_iNwCDfafe`

```
# res body
{
  "student": {
    "attendance": {
      "number": 1,
      "details": [
        "2019-6-2 07:01:17"
      ],
      "hasRecordedAttendance": true
    },
    "absence": {
      "number": 0,
      "details": []
    },
    "attendancePayment": {
      "number": 0,
      "details": []
    },
    "booksPayment": {
      "number": 0,
      "details": []
    },
    "studentId": "",
    "phone": "01115477547",
    "_id": "iNwCDfafe",
    "teacherId": "pBoI9qkMz",
    "groupId": "zrHiAcc0v",
    "name": "Ahmed Mohamed",
    "__v": 2
  }
}
```

#### Student details

`GET /api/groups/student_iNwCDfafe`

```
# res body

{
  "student": {
    "attendance": {
      "number": 1,
      "details": [
        "2019-6-2 07:01:17"
      ],
      "hasRecordedAttendance": true
    },
    "absence": {
      "number": 0,
      "details": []
    },
    "attendancePayment": {
      "number": 0,
      "details": []
    },
    "booksPayment": {
      "number": 0,
      "details": []
    },
    "studentId": "",
    "phone": "01115477547",
    "_id": "iNwCDfafe",
    "teacherId": "pBoI9qkMz",
    "groupId": "zrHiAcc0v",
    "name": "Ahmed Mohamed",
    "__v": 2
  }
}
```
