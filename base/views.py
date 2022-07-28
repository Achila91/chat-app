import random
import time
import json
from unicodedata import name
from .models import RoomMember
from django.shortcuts import render
from agora_token_builder import RtcTokenBuilder
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
# Create your views here.


# creating functions to run the templates
def lobby(request):
    return render(request, 'base/lobby.html')


def room(request):
    return render(request, 'base/room.html')


# to get the token
def getToken(request):
    appId = '384c08e54b034daaae1ce913d721d950'
    appCertificate = '33b20596886b4d6c9b5ad748e7f37be5'
    channelName = request.GET.get('channel')
    uid = random.randint(1, 230)
    expirationTimeInSeconds = 3600 * 24
    currentTimeStamp = time.time()
    privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds
    role = 1  # 1 = host, 2 = guest

    token = RtcTokenBuilder.buildTokenWithUid(
        appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    return JsonResponse({'token': token, 'uid': uid}, safe=False)


@csrf_exempt
def createUser(request):
    data = json.loads(request.body)

    menmber, created = RoomMember.objects.get_or_create(
        name=data['name'],
        uid=data['uid'],
        room_name=data['room_name']
    )
    return JsonResponse({"name": data['name']}, safe=False)


def getMember(request):
    uid = request.GET.get('uid')
    room_name = request.GET.get('room_name')

    member = RoomMember.objects.get(
        uid=uid,
        room_name=room_name,
    )

    name = member.name
    return JsonResponse({'name': member.name}, safe=False)


@csrf_exempt
def deletMember(request):
    data = json.loads(request.body)

    member = RoomMember.objects.get(
        name=data['name'],
        uid=data['uid'],
        room_name=data['room_name'],
    )

    member.delete()
    return JsonResponse('Success', safe=False)
