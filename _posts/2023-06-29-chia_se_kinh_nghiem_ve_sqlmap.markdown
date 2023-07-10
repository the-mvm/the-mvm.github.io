---
layout: post
read_time: true
show_date: true
title:  Một số kinh nghiệm khi sử dụng SQLmap
date:   2023-06-29 21:25:20 +0700
description: SQLMap là một công cụ mạnh mẽ để kiểm tra lỗ hổng SQL Injection trên các ứng dụng web. Tuy nhiên, trong một số trường hợp, SQLMap có thể gặp khó khăn khi cố gắng tìm kiếm và khai thác lỗ hổng. Trong bài viết này, tôi sẽ chia sẻ một số kinh nghiệm bypass sử dụng SQLMap để vượt qua các rào cản phổ biến.
img: posts/20230701/sqlmap_bg2.jpg
tags: [hacking, sql_injection, dorking]
author: C0d3 Whisp3r
mathjax: yes
---
![SQLMap Bypass](https://i0.wp.com/1.bp.blogspot.com/-474Eh-AZdcc/Xt3LZMa3OgI/AAAAAAAAStc/xIwSXNlVmiM_7Pdg7b9MnDyScF2KqJBgwCNcBGAsYHQ/s1600/Atlas_2.png)

SQLMap là một công cụ mạnh mẽ để kiểm tra lỗ hổng SQL Injection trên các ứng dụng web. Tuy nhiên, trong một số trường hợp, SQLMap có thể gặp khó khăn khi cố gắng tìm kiếm và khai thác lỗ hổng. Trong bài viết này, tôi sẽ chia sẻ một số kinh nghiệm bypass sử dụng SQLMap để vượt qua các rào cản phổ biến.

## 1. Điều chỉnh thời gian chờ

SQLMap sử dụng các kỹ thuật thử nghiệm để phát hiện lỗ hổng SQL Injection, và trong quá trình này, nó có thể mất một thời gian đáng kể để thực hiện các yêu cầu và phân tích phản hồi từ máy chủ. Để tăng tốc độ và hiệu suất của SQLMap, bạn có thể điều chỉnh thời gian chờ bằng cách sử dụng các tùy chọn sau:

```
--time-sec=<seconds> : Thiết lập thời gian chờ giữa các yêu cầu (mặc định là 10 giây)
--timeout=<seconds> : Thiết lập thời gian chờ tối đa cho mỗi yêu cầu (mặc định là 30 giây)
```

Bằng cách điều chỉnh thời gian chờ, bạn có thể tăng tốc độ quét và giảm thời gian chờ đợi.

## 2. Sử dụng User-Agent giả mạo

Trong một số trường hợp, ứng dụng web mục tiêu có thể áp dụng các biện pháp bảo vệ chống lại SQL Injection dựa trên User-Agent. SQLMap cung cấp tùy chọn `--random-agent` để giả mạo User-Agent ngẫu nhiên cho mỗi yêu cầu, giúp vượt qua các rào cản này. Bạn có thể sử dụng tùy chọn này như sau:

```--random-agent : Sử dụng User-Agent ngẫu nhiên cho mỗi yêu cầu```


Sử dụng User-Agent giả mạo giúp tránh việc bị chặn hoặc phát hiện bởi các bộ lọc User-Agent.

## 3. Sử dụng tùy chọn HTTP Method khác

Một số ứng dụng web chỉ cho phép các yêu cầu HTTP Method cụ thể như GET hoặc POST. SQLMap mặc định sử dụng GET và POST khi gửi các yêu cầu. Tuy nhiên, bạn có thể thử sử dụng các phương thức HTTP khác như HEAD, PUT, DELETE, hoặc OPTIONS để vượt qua các giới hạn này. Sử dụng tùy chọn `--method` để chỉ định phương thức HTTP muốn sử dụng:

```--method=<method> : Chỉ định phương thức HTTP (GET, POST, HEAD, PUT, DELETE, OPTIONS)```


Bằng cách thử các phương thức HTTP khác nhau, bạn có thể tìm ra phương thức phù hợp để vượt qua bất kỳ giới hạn nào.

## 4. Chỉ định thủ công thông số kiểm tra

SQLMap thường tự động xác định các thông số kiểm tra như cột, bảng hoặc cơ sở dữ liệu. Tuy nhiên, trong một số trường hợp, SQLMap có thể không nhận diện chính xác các thông số này. Trong trường hợp này, bạn có thể sử dụng các tùy chọn sau để chỉ định thủ công các thông số kiểm tra:

```
-d <database> : Chỉ định tên cơ sở dữ liệu
-T <table> : Chỉ định tên bảng
-C <columns> : Chỉ định tên các cột
```


Bằng cách chỉ định thông số kiểm tra thủ công, bạn có thể khai thác lỗ hổng SQL Injection một cách chính xác hơn.

Đó là một số kinh nghiệm bypass sử dụng SQLMap để vượt qua các rào cản phổ biến. Hãy sử dụng những kỹ thuật này một cách cân nhắc và có trách nhiệm khi thực hiện kiểm thử bảo mật trên các ứng dụng web.

