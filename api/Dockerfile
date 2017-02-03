FROM python

RUN pip install eve
RUN pip install docxtpl

COPY ./ /work
WORKDIR /work

EXPOSE 8080

ENV PORT=8080

CMD python -u run.py

