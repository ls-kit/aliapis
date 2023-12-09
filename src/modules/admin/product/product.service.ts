import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Fetch } from '../../../common/lib/Fetch';
import appConfig from '../../../config/app.config';

@Injectable()
export class ProductService {
  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  async findAll() {
    const products = await Fetch.get(
      `http://otapi.net/service-json/BatchSearchItemsFrame?instanceKey=${
        appConfig().otapi.instance_key
      }&language=en&signature=&timestamp=&sessionId=&xmlParameters=%3CSearchItemsParameters%3E%3CItemTitle%3Etshirt%3C%2FItemTitle%3E%3C%2FSearchItemsParameters%3E&framePosition=0&frameSize=5&blockList=`,
    );
    return products;
  }





  async getCategoryList() {
    const category_List = await Fetch.get(
     `http://otapi.net/service-json/GetRootCategoryInfoList?instanceKey=${appConfig().otapi.instance_key}&language=en&signature=&timestamp=`
    );
    return category_List;
    
  }


  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
