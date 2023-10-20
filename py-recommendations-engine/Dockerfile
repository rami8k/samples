ARG  REGISTRY=12345.dkr.ecr.us-east-1.amazonaws.com/
FROM ${REGISTRY}library/python:3.8-alpine3.11

RUN apk update
RUN apk add --no-cache --virtual build-base musl libc6-compat
RUN apk add python3 py3-pip python3-dev

RUN apk add --update curl gcc g++ \
    && rm -rf /var/cache/apk/*
RUN ln -s /usr/include/locale.h /usr/include/xlocale.h


COPY ./src/tasks/ /app/src/tasks
COPY ./src/core/ /app/src/core
COPY ./src/utils/ /app/src/utils

WORKDIR /app/src/tasks

RUN pip3 install awscli
RUN pip install -r requirements.txt -t .
RUN pip install numpy pandas -t .

ENV PYTHONPATH "/usr/lib/python3.8/site-packages"
ENTRYPOINT ["python3.8"]