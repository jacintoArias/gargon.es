FROM node:8.13.0

RUN apt-get update; \
  apt-get install -y \
  build-essential;

RUN apt-get install -y ruby-full;

RUN gem install jekyll bundler;

# RUN useradd -ms /bin/bash jekyll

# USER jekyll

ENV APP_FOLDER=/opt/app/

WORKDIR $APP_FOLDER

COPY Gemfile $APP_FOLDER

RUN bundle install --no-cache --path vendor

COPY package.json yarn.lock $APP_FOLDER/

RUN yarn install

EXPOSE 4000

CMD ["yarn", "run", "gulp"]
