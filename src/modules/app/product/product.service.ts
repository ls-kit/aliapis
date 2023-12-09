import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import appConfig from '../../../config/app.config';
import { Fetch } from '../../../common/lib/Fetch';

@Injectable()
export class ProductService {
  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  async findAll() {
    const products = await Fetch.get(
      `http://otapi.net/service-json/BatchSearchItemsFrame?instanceKey=${
        appConfig().otapi.instance_key
      }&language=en&signature=&timestamp=&sessionId=&xmlParameters=%3CSearchItemsParameters%3E%3CItemTitle%3Etshirt%3C%2FItemTitle%3E%3C%2FSearchItemsParameters%3E&framePosition=0&frameSize=10&blockList=`,
    );
    return products;
  }

  async findOne(id: string) {
    const products = await Fetch.get(
      `
      http://otapi.net/service-json/BatchGetItemFullInfo?instanceKey=${
        appConfig().otapi.instance_key
      }&language=&signature=&timestamp=&sessionId=&itemParameters=&itemId=${id}&blockList=`,
    );
    return products;
  }

  // find all category list
  async getCategoryList() {
    const category_List = await Fetch.get(
      `http://otapi.net/service-json/GetThreeLevelRootCategoryInfoList?instanceKey=${
        appConfig().otapi.instance_key
      }&language=en&signature=&timestamp=`,
    );
    return category_List;
  }

  // find product by category id
  async getCategoryProducts(categoryId: string) {
    console.log(categoryId);
    const products = await Fetch.get(
      `http://otapi.net/service-json/BatchSearchItemsFrame?instanceKey=${
        appConfig().otapi.instance_key
      }&language=en&signature=&timestamp=&sessionId=&xmlParameters=%3CSearchItemsParameters%3E%3CProvider%3ETaobao%3C%2FProvider%3E%3CCategoryId%3E${categoryId}%3C%2FCategoryId%3E%3C%2FSearchItemsParameters%3E&framePosition=0&frameSize=20&blockList=AvailableSearchMethods`,
    );

    return products;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
